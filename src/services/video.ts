import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { createClient } from '@supabase/supabase-js';

class VideoService {
  private client: IAgoraRTCClient;
  private localAudioTrack: IMicrophoneAudioTrack | null = null;
  private localVideoTrack: ICameraVideoTrack | null = null;
  private supabase;

  constructor() {
    this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
  }

  async joinChannel(channelName: string, uid: string) {
    try {
      // Join the channel
      const appId = import.meta.env.VITE_AGORA_APP_ID;
      if (!appId) throw new Error('Agora App ID not found');

      await this.client.join(appId, channelName, null, uid);

      // Create and publish local tracks
      [this.localAudioTrack, this.localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      await this.client.publish([this.localAudioTrack, this.localVideoTrack]);

      return {
        localAudioTrack: this.localAudioTrack,
        localVideoTrack: this.localVideoTrack,
      };
    } catch (error) {
      console.error('Error joining channel:', error);
      throw error;
    }
  }

  async leaveChannel() {
    try {
      // Unpublish and close local tracks
      if (this.localAudioTrack) {
        await this.client.unpublish(this.localAudioTrack);
        this.localAudioTrack.close();
      }
      if (this.localVideoTrack) {
        await this.client.unpublish(this.localVideoTrack);
        this.localVideoTrack.close();
      }

      // Leave the channel
      await this.client.leave();
    } catch (error) {
      console.error('Error leaving channel:', error);
      throw error;
    }
  }

  async toggleAudio(enabled: boolean) {
    if (this.localAudioTrack) {
      await this.localAudioTrack.setEnabled(enabled);
    }
  }

  async toggleVideo(enabled: boolean) {
    if (this.localVideoTrack) {
      await this.localVideoTrack.setEnabled(enabled);
    }
  }

  async startScreenShare() {
    try {
      const screenTrack = await AgoraRTC.createScreenVideoTrack();
      if (this.localVideoTrack) {
        await this.client.unpublish(this.localVideoTrack);
      }
      await this.client.publish(screenTrack);
      return screenTrack;
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  }

  async stopScreenShare(screenTrack: any) {
    try {
      await this.client.unpublish(screenTrack);
      screenTrack.close();
      if (this.localVideoTrack) {
        await this.client.publish(this.localVideoTrack);
      }
    } catch (error) {
      console.error('Error stopping screen share:', error);
      throw error;
    }
  }

  onUserJoined(callback: (user: any) => void) {
    this.client.on('user-joined', callback);
  }

  onUserLeft(callback: (user: any) => void) {
    this.client.on('user-left', callback);
  }

  onUserPublished(callback: (user: any, mediaType: any) => void) {
    this.client.on('user-published', callback);
  }

  onUserUnpublished(callback: (user: any, mediaType: any) => void) {
    this.client.on('user-unpublished', callback);
  }
}

export const videoService = new VideoService();