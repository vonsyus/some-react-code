import {FC, useState} from 'react';
import '@splidejs/react-splide/css';
import {useFadeIn} from '@/hooks/useFadeIn';
import {Splide, SplideSlide, SplideTrack} from '@splidejs/react-splide';
import {SliderArrow} from '../../icons/Icons';
import cn from 'classnames';
import {useTheme} from '@/hooks/useTheme';

type MediaWithTextItem = {
    type: 'image' | 'video';
    src: string;
    text: string;
    backgroundImagePosition?: string;
};
type Props = {
    items: MediaWithTextItem[];
    widerTextMode: boolean;
    shorterTextMode: boolean;
    // we may have more than 1 block on a page, and they may have different styles, so this for the theme rewriting
    theme?: string;
};

const MediaWithTextItem: FC<MediaWithTextItem & Omit<Props, 'items'>> = (props) => {
    const theme = useTheme();
    const {
        type,
        src,
        backgroundImagePosition = 'center',
        text,
        widerTextMode,
        shorterTextMode,
        theme: priorityTheme,
    } = props;
    return (
        <div className={cn('mediaWithText', {'wide-text-mode': widerTextMode})}>
            <div className="mediaWithText-img">
                {type === 'video' ? (
                    <video style={{width: '100%', height: '100%'}} autoPlay muted playsInline loop>
                        <source src={src}/>
                    </video>
                ) : (
                    <img style={{objectPosition: backgroundImagePosition}} src={src} alt=""/>
                )}
            </div>
            <div
                className={cn('mediaWithText-text mediaWithText-fade p-desktop p-mobile', {
                    'shorter-text-mode': shorterTextMode,
                    'mediaWithText-dark': theme === 'nascent' && !priorityTheme,
                    [`mediaWithText--${priorityTheme}`]: !!priorityTheme,
                })}
                dangerouslySetInnerHTML={{__html: text}}
                data-fade-in
            />
        </div>
    );
};

export const MediaWithText: FC<Props> = ({items, widerTextMode = false, shorterTextMode = false, theme}) => {
    const [ref, setRef] = useState<HTMLElement | null>(null);
    useFadeIn(ref, 'data-fade-in');


    // strict type is often unecessary for our needs
    // and so we need to do complicated things for simple tasks, such as this:
    const shuffle = (array: string[]) => {
        return array.sort(() => Math.random() - 0.5);
    };
    let items2 = Array()
    if (items.length > 1) {
        for (let i = 0; i < items.length; i++) {
            items2[i] = items[i]
        }
        if (theme == 'nascent-quotes-slider') {
            items2 = shuffle(items2)
        }
    }

    return (
        <section className={cn('mediaWithText-wrapper', {'wide-text-mode': true})} ref={setRef}>
            {items2.length > 1 ? (
                <Splide hasTrack={false} options={{pagination: false, type: 'loop'}} className="mediaWithText-slider">
                    <SplideTrack>
                        {items2.map((item, i) => (
                            <SplideSlide key={i}>
                                <MediaWithTextItem
                                    {...item}
                                    widerTextMode={widerTextMode}
                                    shorterTextMode={shorterTextMode}
                                    theme={theme}
                                />
                            </SplideSlide>
                        ))}
                    </SplideTrack>
                    <div className="splide__arrows">
                        <button className="splide__arrow--prev mediaWithText-arrow">
                            <SliderArrow color="#ffffff"/>
                        </button>
                        <button className="splide__arrow--next mediaWithText-arrow">
                            <SliderArrow color="#ffffff"/>
                        </button>
                    </div>
                </Splide>
            ) : (
                <MediaWithTextItem
                    {...items[0]}
                    widerTextMode={widerTextMode}
                    shorterTextMode={shorterTextMode}
                    theme={theme}
                />
            )}
        </section>
    );
};
