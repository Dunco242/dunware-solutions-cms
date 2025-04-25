import React from 'react';
import { ArrowLeft, Reply, ReplyAll, Forward, MoreVertical, Download } from 'lucide-react';
import { Email } from '../../types';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import { format } from 'date-fns';

interface EmailThreadProps {
  email: Email;
  onClose: () => void;
  onReply: (email: Partial<Email>) => Promise<void>;
}

const EmailThread: React.FC<EmailThreadProps> = ({ email, onClose, onReply }) => {
  const handleReply = () => {
    onReply({
      to: [email.from],
      subject: `Re: ${email.subject}`,
      thread: email.thread,
      parentMessageId: email.id,
    });
  };

  const handleReplyAll = () => {
    onReply({
      to: [email.from, ...email.to.filter(addr => addr !== email.from)],
      cc: email.cc,
      subject: `Re: ${email.subject}`,
      thread: email.thread,
      parentMessageId: email.id,
    });
  };

  const handleForward = () => {
    onReply({
      subject: `Fwd: ${email.subject}`,
      body: `---------- Forwarded message ---------\nFrom: ${email.from}\nDate: ${format(new Date(email.timestamp), 'PPpp')}\nSubject: ${email.subject}\nTo: ${email.to.join(', ')}\n\n${email.body}`,
      attachments: email.attachments,
    });
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onClose}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to inbox
        </button>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleReply}>
            <Reply size={16} className="mr-2" />
            Reply
          </Button>
          <Button variant="outline" size="sm" onClick={handleReplyAll}>
            <ReplyAll size={16} className="mr-2" />
            Reply All
          </Button>
          <Button variant="outline" size="sm" onClick={handleForward}>
            <Forward size={16} className="mr-2" />
            Forward
          </Button>
          <Button variant="outline" size="sm">
            <MoreVertical size={16} />
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            {email.subject}
          </h1>

          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center">
              <Avatar
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(email.from)}`}
                alt={email.from}
                size="lg"
              />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">{email.from}</p>
                <p className="text-sm text-gray-500">
                  To: {email.to.join(', ')}
                  {email.cc && email.cc.length > 0 && (
                    <>
                      <br />
                      Cc: {email.cc.join(', ')}
                    </>
                  )}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {format(new Date(email.timestamp), 'PPpp')}
            </p>
          </div>

          <div className="prose max-w-none">
            {email.html ? (
              <div dangerouslySetInnerHTML={{ __html: email.body }} />
            ) : (
              <pre className="whitespace-pre-wrap font-sans">{email.body}</pre>
            )}
          </div>

          {email.attachments && email.attachments.length > 0 && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">
                Attachments ({email.attachments.length})
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {email.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center p-3 border rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {attachment.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {Math.round(attachment.size / 1024)} KB
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download size={16} className="mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailThread;