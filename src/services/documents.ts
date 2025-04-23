import { createClient } from '@supabase/supabase-js';
import { diffChars } from 'diff';
import { create as createJSONDiffPatch } from 'jsondiffpatch';
import CryptoJS from 'crypto-js';

interface DocumentVersion {
  id: string;
  documentId: string;
  content: string;
  metadata: any;
  createdAt: string;
  createdBy: string;
  changes?: string;
}

interface DocumentApproval {
  id: string;
  documentId: string;
  version: string;
  status: 'pending' | 'approved' | 'rejected';
  approver: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

class DocumentService {
  private supabase;
  private jsonDiffPatch;

  constructor() {
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
    this.jsonDiffPatch = createJSONDiffPatch();
  }

  // Document CRUD operations
  async createDocument(data: any) {
    try {
      // Encrypt sensitive content if needed
      const encryptedContent = data.content ? this.encryptContent(data.content) : null;

      const { data: document, error } = await this.supabase
        .from('documents')
        .insert({
          ...data,
          encrypted_content: encryptedContent,
          version: 1,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      // Create initial version
      await this.createVersion(document.id, data.content, data.metadata);

      return document;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  async getDocument(id: string) {
    try {
      const { data: document, error } = await this.supabase
        .from('documents')
        .select(`
          *,
          versions:document_versions (*),
          approvals:document_shares (*),
          created_by:auth.users!documents_created_by_fkey (
            id,
            email,
            raw_user_meta_data
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Decrypt content if encrypted
      if (document.encrypted_content) {
        document.content = this.decryptContent(document.encrypted_content);
      }

      return document;
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  }

  async updateDocument(id: string, data: any) {
    try {
      const currentDoc = await this.getDocument(id);
      
      // Create new version
      const version = await this.createVersion(
        id,
        data.content,
        data.metadata,
        currentDoc.versions[currentDoc.versions.length - 1]
      );

      // Encrypt content if needed
      const encryptedContent = data.content ? this.encryptContent(data.content) : null;

      // Update document metadata
      const { data: document, error } = await this.supabase
        .from('documents')
        .update({
          ...data,
          encrypted_content: encryptedContent,
          version: currentDoc.version + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { document, version };
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  // Version control
  private async createVersion(
    documentId: string,
    content: string,
    metadata: any,
    previousVersion?: DocumentVersion
  ) {
    try {
      let changes;
      if (previousVersion) {
        // Calculate content diff
        const contentDiff = diffChars(previousVersion.content, content);
        const metadataDiff = this.jsonDiffPatch.diff(
          previousVersion.metadata,
          metadata
        );
        
        changes = JSON.stringify({
          content: contentDiff,
          metadata: metadataDiff
        });
      }

      // Encrypt content
      const encryptedContent = this.encryptContent(content);

      const { data: version, error } = await this.supabase
        .from('document_versions')
        .insert({
          document_id: documentId,
          encrypted_content: encryptedContent,
          version_number: previousVersion ? previousVersion.version + 1 : 1,
          changes,
          created_by: (await this.supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return version;
    } catch (error) {
      console.error('Error creating version:', error);
      throw error;
    }
  }

  async getVersion(documentId: string, versionId: string) {
    try {
      const { data: version, error } = await this.supabase
        .from('document_versions')
        .select(`
          *,
          created_by:auth.users!document_versions_created_by_fkey (
            id,
            email,
            raw_user_meta_data
          )
        `)
        .eq('document_id', documentId)
        .eq('id', versionId)
        .single();

      if (error) throw error;

      // Decrypt content
      version.content = this.decryptContent(version.encrypted_content);

      return version;
    } catch (error) {
      console.error('Error getting version:', error);
      throw error;
    }
  }

  async compareVersions(documentId: string, version1: string, version2: string) {
    try {
      const [v1, v2] = await Promise.all([
        this.getVersion(documentId, version1),
        this.getVersion(documentId, version2)
      ]);

      const contentDiff = diffChars(v1.content, v2.content);
      const metadataDiff = this.jsonDiffPatch.diff(v1.metadata, v2.metadata);

      return {
        content: contentDiff,
        metadata: metadataDiff
      };
    } catch (error) {
      console.error('Error comparing versions:', error);
      throw error;
    }
  }

  // Document sharing
  async shareDocument(documentId: string, userId: string, permissionLevel: 'view' | 'comment' | 'edit' = 'view', expiresAt?: Date) {
    try {
      const { data: share, error } = await this.supabase
        .from('document_shares')
        .insert({
          document_id: documentId,
          shared_with: userId,
          permission_level: permissionLevel,
          expires_at: expiresAt?.toISOString(),
          created_by: (await this.supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return share;
    } catch (error) {
      console.error('Error sharing document:', error);
      throw error;
    }
  }

  async updateShare(shareId: string, updates: Partial<{ permissionLevel: string; expiresAt: Date }>) {
    try {
      const { data: share, error } = await this.supabase
        .from('document_shares')
        .update({
          permission_level: updates.permissionLevel,
          expires_at: updates.expiresAt?.toISOString(),
        })
        .eq('id', shareId)
        .select()
        .single();

      if (error) throw error;
      return share;
    } catch (error) {
      console.error('Error updating share:', error);
      throw error;
    }
  }

  async revokeShare(shareId: string) {
    try {
      const { error } = await this.supabase
        .from('document_shares')
        .delete()
        .eq('id', shareId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error revoking share:', error);
      throw error;
    }
  }

  // Document templates
  async createTemplate(template: {
    name: string;
    content: string;
    description?: string;
    category?: string;
    isShared?: boolean;
  }) {
    try {
      const { data, error } = await this.supabase
        .from('document_templates')
        .insert({
          name: template.name,
          content: template.content,
          description: template.description,
          category: template.category,
          is_shared: template.isShared,
          created_by: (await this.supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  async getTemplates(category?: string) {
    try {
      let query = this.supabase
        .from('document_templates')
        .select(`
          *,
          created_by:auth.users!document_templates_created_by_fkey (
            id,
            email,
            raw_user_meta_data
          )
        `);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  }

  // Content encryption/decryption
  private encryptContent(content: string): string {
    return CryptoJS.AES.encrypt(
      content,
      import.meta.env.VITE_ENCRYPTION_KEY
    ).toString();
  }

  private decryptContent(encryptedContent: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(
        encryptedContent,
        import.meta.env.VITE_ENCRYPTION_KEY
      );
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Error decrypting content:', error);
      return '[Encrypted Content]';
    }
  }

  // File operations
  async uploadAttachment(file: File, documentId: string) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `documents/${documentId}/${fileName}`;

      const { data, error } = await this.supabase.storage
        .from('attachments')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = this.supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);

      return {
        id: data.path,
        name: file.name,
        type: file.type,
        url: publicUrl,
        size: file.size,
      };
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  }

  async deleteAttachment(attachmentId: string) {
    try {
      const { error } = await this.supabase.storage
        .from('attachments')
        .remove([attachmentId]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting attachment:', error);
      throw error;
    }
  }

  // Search and filtering
  async searchDocuments(query: string, filters?: {
    category?: string;
    status?: string;
    createdBy?: string;
    dateRange?: { start: Date; end: Date };
  }) {
    try {
      let dbQuery = this.supabase
        .from('documents')
        .select(`
          *,
          created_by:auth.users!documents_created_by_fkey (
            id,
            email,
            raw_user_meta_data
          )
        `)
        .textSearch('title', query, {
          type: 'websearch',
          config: 'english'
        });

      if (filters) {
        if (filters.category) {
          dbQuery = dbQuery.eq('category', filters.category);
        }
        if (filters.status) {
          dbQuery = dbQuery.eq('status', filters.status);
        }
        if (filters.createdBy) {
          dbQuery = dbQuery.eq('created_by', filters.createdBy);
        }
        if (filters.dateRange) {
          dbQuery = dbQuery
            .gte('created_at', filters.dateRange.start.toISOString())
            .lte('created_at', filters.dateRange.end.toISOString());
        }
      }

      const { data, error } = await dbQuery;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  }
}

export const documentService = new DocumentService();