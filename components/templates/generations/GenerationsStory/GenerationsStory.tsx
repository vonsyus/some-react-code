import { FC, useState } from 'react';
import { useAddVisibleClass } from '@/hooks/useVisibleLines';
import styles from './GenerationsStory.module.scss';
import { Mark3Svg, Mark4Svg } from '@/svg';
import { useFadeIn } from '@/hooks/useFadeIn';
import { Parallax, ParallaxProvider } from 'react-scroll-parallax';
import { useDeviceSize } from '@/hooks/useDeviceSize';
import { Video } from '@/components/molecules';
import { ScaleOpacityEffect } from 'parallax-controller/src/types';

type Props = {
  followText: string;
  heading: string;
  textUnderHeading: string;
  rightImage: string;
  textUnderRightImage: string;
  textAboveLeftImage: string;
  video: { id: string; thumbnailUrl: string };
  textUnderLeftImage: string;
  collageImages: string[];
  gridImages: { text: string; src: string }[];
};

const COLLAGE_PARALLAX_MAP = {
  mobile: [-6, -1, 3, 1],
  desktop: [-17, -5, 10, 3],
};
const GRID_PARALLAX_MAP = {
  mobile: [1, 1, 1, 1],
  desktop: [-5, -5, -5, -5],
};

const FADEIN_ON_SCROLL_CONFIG: ScaleOpacityEffect = [-0.2, 2];

export const GenerationsStory: FC<Props> = (props) => {
  const {
    followText,
    heading,
    textUnderHeading,
    rightImage,
    textUnderRightImage,
    textAboveLeftImage,
    video,
    textUnderLeftImage,
    collageImages,
    gridImages,
  } = props;
  const [ref, setRef] = useState<HTMLElement | null>(null);
  useAddVisibleClass(ref, 'data-lines-animation', 'lines-visible', 300);
  useFadeIn(ref, 'data-fade-in');
  const { isDesktop } = useDeviceSize();

  return (
    <ParallaxProvider>
      <div ref={setRef}>
        <div className={styles.followContainer}>
          <div className={styles.verticalFollowLine} data-lines-animation />
          <div className={styles.horizontalFollowLine} data-lines-animation />
          <div className={styles.followText} data-fade-in>
            {followText}
          </div>
        </div>

        <section className={styles.container}>
          <div className={styles.verticalLineAboveRightImage} data-lines-animation>
            <Mark3Svg className={styles.markAboveRightImage} width={52} height={30} fill="#9C1826" />
          </div>

          <div className={styles.content}>
            <h2 className={`h3-mobile h3-desktop ${styles.heading}`} data-fade-in>
              {heading}
            </h2>
            <Parallax opacity={FADEIN_ON_SCROLL_CONFIG}>
              <div
                className={`p-desktop p-mobile ${styles.textUnderHeading}`}
                dangerouslySetInnerHTML={{ __html: textUnderHeading }}
              />
            </Parallax>
            <div className={styles.rightImageWrapper}>
              <Parallax speed={isDesktop ? -5 : -2}>
                <img src={rightImage} alt="" />
              </Parallax>
              <div className={styles.verticalLineUnderRightImage} data-lines-animation>
                <Mark4Svg className={styles.markUnderRightImage} width={35} height={300} fill="#fbc201" />
                <div className={styles.horizontalLineToLeftImage} data-lines-animation />
              </div>
            </div>
            <Parallax opacity={FADEIN_ON_SCROLL_CONFIG}>
              <div
                className={`p-desktop p-mobile ${styles.textUnderRightImage}`}
                dangerouslySetInnerHTML={{ __html: textUnderRightImage }}
              />
            </Parallax>
            <Parallax opacity={FADEIN_ON_SCROLL_CONFIG}>
              <div
                className={`p-desktop p-mobile ${styles.textAboveLeftImage}`}
                dangerouslySetInnerHTML={{ __html: textAboveLeftImage }}
              />
            </Parallax>
            <Parallax speed={14} style={{ position: 'relative', zIndex: 1 }}>
              <div className={styles.leftImageWrapper}>
                <div className={styles.verticalLineUnderLeftImage} data-lines-animation />
                <Video {...video} />
              </div>
            </Parallax>
            <Parallax opacity={FADEIN_ON_SCROLL_CONFIG}>
              <div
                className={`p-desktop p-mobile ${styles.textUnderLeftImage}`}
                dangerouslySetInnerHTML={{ __html: textUnderLeftImage }}
              />
            </Parallax>

            {collageImages.length && (
              <div className={styles.collageImages}>
                {collageImages.map((src, index) => (
                  <div key={src}>
                    <Parallax speed={COLLAGE_PARALLAX_MAP[isDesktop ? 'desktop' : 'mobile'][index]}>
                      <img src={src} alt="" />
                    </Parallax>
                  </div>
                ))}
              </div>
            )}
          </div>

          {gridImages.length && (
            <div className={styles.gridImages}>
              {gridImages.map(({ text, src }, index) => (
                <Parallax speed={GRID_PARALLAX_MAP[isDesktop ? 'desktop' : 'mobile'][index]} key={src}>
                  <div>
                    <div>
                      {index === 0 && <div className={styles.verticalLine1to3GridImage} data-lines-animation />}
                      {index === 1 && <div className={styles.verticalLine2to4GridImage} data-lines-animation />}
                      {index === 2 && <div className={styles.horizontalLine3to4GridImage} data-lines-animation />}
                      {index === 3 && <div className={styles.verticalLine4toTheEhdGridImage} data-lines-animation />}

                      <img src={src} alt={text} />
                      <p className={`caption ${styles.imageCaption}`} dangerouslySetInnerHTML={{ __html: text }}></p>
                    </div>
                  </div>
                </Parallax>
              ))}
            </div>
          )}
        </section>
      </div>
    </ParallaxProvider>
  );
};
