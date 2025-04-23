import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Video as VideoIcon, Users, Mic, MicOff, Camera, CameraOff, PhoneOff, ScreenShare, MessageSquare, Settings, Plus } from 'lucide-react';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { videoService } from '../../services/video';

const VideoPage: React.FC = () => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [participants, setParticipants] = useState([
    {
      id: '1',
      name: 'John Doe',
      avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150',
      role: 'Host',
      audioEnabled: true,
      videoEnabled: true,
    },
    {
      id: '2',
      name: 'Sarah Miller',
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150',
      role: 'Participant',
      audioEnabled: true,
      videoEnabled: true,
    }
  ]);

  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRefs = useRef<{ [key: string]: HTMLDivElement }>({});
  const screenShareTrackRef = useRef<any>(null);

  useEffect(() => {
    if (isInCall) {
      const initializeCall = async () => {
        try {
          const { localAudioTrack, localVideoTrack } = await videoService.joinChannel('test-channel', '1');
          
          if (localVideoTrack && localVideoRef.current) {
            localVideoTrack.play(localVideoRef.current);
          }

          // Set up event listeners
          videoService.onUserJoined((user) => {
            setParticipants(prev => [...prev, {
              id: user.uid,
              name: `User ${user.uid}`,
              avatar: '',
              role: 'Participant',
              audioEnabled: true,
              videoEnabled: true,
            }]);
          });

          videoService.onUserLeft((user) => {
            setParticipants(prev => prev.filter(p => p.id !== user.uid));
          });

          videoService.onUserPublished(async (user, mediaType) => {
            await videoService.client.subscribe(user, mediaType);
            if (mediaType === 'video' && remoteVideoRefs.current[user.uid]) {
              user.videoTrack.play(remoteVideoRefs.current[user.uid]);
            }
          });
        } catch (error) {
          console.error('Error initializing call:', error);
        }
      };

      initializeCall();

      return () => {
        videoService.leaveChannel();
      };
    }
  }, [isInCall]);

  const handleToggleAudio = async () => {
    await videoService.toggleAudio(!isAudioEnabled);
    setIsAudioEnabled(!isAudioEnabled);
  };

  const handleToggleVideo = async () => {
    await videoService.toggleVideo(!isVideoEnabled);
    setIsVideoEnabled(!isVideoEnabled);
  };

  const handleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenTrack = await videoService.startScreenShare();
        screenShareTrackRef.current = screenTrack;
      } else {
        await videoService.stopScreenShare(screenShareTrackRef.current);
        screenShareTrackRef.current = null;
      }
      setIsScreenSharing(!isScreenSharing);
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  };

  const handleEndCall = async () => {
    await videoService.leaveChannel();
    setIsInCall(false);
  };

  return (
    <div className="py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Video Conferencing</h1>
          <p className="mt-1 text-gray-600">Host and join video meetings</p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <Button onClick={() => setIsInCall(true)} disabled={isInCall}>
            <Plus size={16} className="mr-2" />
            New Meeting
          </Button>
        </div>
      </div>

      {/* Main Video Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Video Feed */}
        <div className="lg:col-span-3">
          <Card className="bg-gray-900">
            <div className="aspect-video relative">
              {/* Main video feed */}
              <div ref={localVideoRef} className="absolute inset-0 flex items-center justify-center">
                {!isInCall && (
                  <div className="text-white text-center">
                    <VideoIcon size={48} className="mx-auto mb-2 opacity-20" />
                    <p className="text-sm opacity-60">Start a meeting to begin video call</p>
                  </div>
                )}
              </div>

              {/* Participant video thumbnails */}
              <div className="absolute bottom-4 right-4 flex space-x-2">
                {participants.map(participant => (
                  <div
                    key={participant.id}
                    ref={el => {
                      if (el) remoteVideoRefs.current[participant.id] = el;
                    }}
                    className="w-32 h-24 bg-gray-800 rounded-lg overflow-hidden relative"
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Avatar
                        src={participant.avatar}
                        alt={participant.name}
                        size="lg"
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-1">
                      <p className="text-white text-xs truncate">{participant.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Controls */}
            {isInCall && (
              <div className="bg-gray-800 p-4">
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    variant={isAudioEnabled ? 'outline' : 'danger'}
                    onClick={handleToggleAudio}
                    className="rounded-full w-12 h-12 flex items-center justify-center"
                  >
                    {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                  </Button>
                  <Button
                    variant={isVideoEnabled ? 'outline' : 'danger'}
                    onClick={handleToggleVideo}
                    className="rounded-full w-12 h-12 flex items-center justify-center"
                  >
                    {isVideoEnabled ? <Camera size={20} /> : <CameraOff size={20} />}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleEndCall}
                    className="rounded-full w-12 h-12 flex items-center justify-center"
                  >
                    <PhoneOff size={20} />
                  </Button>
                  <Button
                    variant={isScreenSharing ? 'primary' : 'outline'}
                    onClick={handleScreenShare}
                    className="rounded-full w-12 h-12 flex items-center justify-center"
                  >
                    <ScreenShare size={20} />
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full w-12 h-12 flex items-center justify-center"
                  >
                    <MessageSquare size={20} />
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full w-12 h-12 flex items-center justify-center"
                  >
                    <Settings size={20} />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Participants List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Participants</h2>
                <div className="flex items-center">
                  <Users size={16} className="text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{participants.length}</span>
                </div>
              </div>
            </CardHeader>
            <div className="divide-y divide-gray-200">
              {participants.map(participant => (
                <div key={participant.id} className="p-4">
                  <div className="flex items-center">
                    <Avatar
                      src={participant.avatar}
                      alt={participant.name}
                      size="md"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                          <p className="text-xs text-gray-500">{participant.role}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!participant.audioEnabled && (
                            <MicOff size={14} className="text-gray-400" />
                          )}
                          {!participant.videoEnabled && (
                            <CameraOff size={14} className="text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;