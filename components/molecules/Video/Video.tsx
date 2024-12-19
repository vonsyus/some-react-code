import { ComponentProps, FC, useEffect, useState } from 'react';
import { useYouTubeIframeApi } from './useYoutubeIframeApi';
import { YTPlayer } from './YoutubeIframeApi';
import { Play } from '../../icons/Icons';
import { Parallax } from 'react-scroll-parallax';
import { useDeviceSize } from '@/hooks/useDeviceSize';

type ParallaxWrapperProps = ComponentProps<typeof Parallax> & {
  disableParallaxOnMobiles?: boolean;
  isFloating?: boolean;
};

type Props = ParallaxWrapperProps & {
  id: string;
  thumbnailUrl: string;
  autoplay?: boolean;
  caption?: string;
};

const ParallaxWrapper: FC<ParallaxWrapperProps> = (props) => {
  const { children, disableParallaxOnMobiles = false, isFloating = false, ...rest } = props;
  const { isMobile } = useDeviceSize();
  const isParallaxDisabled = !isFloating || (isMobile && disableParallaxOnMobiles);
  const parallaxProps = isParallaxDisabled ? {} : { translateY: ['50%', '-50%'], ...rest };

  return <Parallax {...parallaxProps}>{children}</Parallax>;
};

export const Video: FC<Props> = (props) => {
  const { id, thumbnailUrl, autoplay, caption, ...rest } = props;
  const [videoDivRef, setVideoDivRef] = useState<HTMLDivElement | null>(null);
  const [player, setPlayer] = useState<YTPlayer | undefined>();
  const [isUiHidden, setIsUiHidden] = useState(false);
  const YT = useYouTubeIframeApi()!;

  useEffect(() => {
    if (!videoDivRef || !YT) return;
    const placeholder = document.createElement('div');
    videoDivRef.appendChild(placeholder);
    const videoId = id;
    const player = new YT.Player(placeholder, {
      videoId,
      playerVars: {
        loop: 0,
      },
      events: {
        onReady: (event) => {
          setPlayer(event.target);
          if (autoplay && player) {
            setIsUiHidden(true);
            player.mute();
            player.playVideo();
          }
        },
      },
    });
    return () => {
      setPlayer(undefined);
      player.destroy();
      placeholder.parentElement?.removeChild(placeholder);
    };
  }, [YT, videoDivRef, id, autoplay]);

  const onBtnClick = () => {
    if (!player) return;

    setIsUiHidden(true);
    player.playVideo();
  };

  return (
    <ParallaxWrapper {...rest}>
      <div className="video-wrapper">
        <div className="video" ref={setVideoDivRef}>
          <img src={thumbnailUrl} className="video-thumbnail" style={{ display: isUiHidden ? 'none' : 'block' }} />
          <button onClick={onBtnClick} className="video-button" style={{ display: isUiHidden ? 'none' : 'block' }}>
            <Play />
          </button>
        </div>
        {caption && (
          <div className="video-caption">
            <span>{caption}</span>
          </div>
        )}
      </div>
    </ParallaxWrapper>
  );
};
