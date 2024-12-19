import styles from './GenerationsFixedBuyNowButton.module.scss';
import {FC, MouseEventHandler, useEffect, useState} from 'react';
import cn from 'classnames';
import {
    useGenerationsContract,
    useDeviceSize,
    useAvailableSlots,
    useAuth,
    useNav,
    useProfile,
    QRTokensDetect,
    useQRTokensDetect,
} from '@/hooks';
import {
    GenerationsClaimsModal
} from '@/components/templates/generations/GenerationsFixedBuyNowButton/GenerationsClaimsModal';
import {ContractStatusEnum} from '@/purchase/types';
import {GENERATIONS_SPECIAL_TOKEN} from '@/purchase/PurchaseClient';
import {useWeb3React} from '@web3-react/core';

export const GENERATIONS_BUY_START_POSITION_CLASS = 'generation-start-buy-now';

const IS_SHOW_GET_EARLY_ACCESS = false;

const GetEarlyAccess = ({isVisible}: { isVisible: boolean }) => {
    const {setSubscribeState} = useNav();
    const onGetAccessClick = () => setSubscribeState(true);

    return (
        <button
            className={cn('shadow-button h5-desktop h5-semi-mobile', styles.button, {_visible: isVisible})}
            onClick={onGetAccessClick}>
            Get Early Access
        </button>
    );
};

const QRTokensDetectInstance = new QRTokensDetect();

const BuyNow = ({isVisible}: { isVisible: boolean }) => {
    const {setSubscribeState} = useNav();
    const {isSpecialToken} = useQRTokensDetect(GENERATIONS_SPECIAL_TOKEN);
    const {soldOut, status, loaded} = useGenerationsContract();
    const {profileService} = useProfile();
    const {availableSlots} = useAvailableSlots(loaded, status);
    const isPresale = status === ContractStatusEnum.presale;
    const isComingSoon = isPresale && !availableSlots && !isSpecialToken;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const {openNav} = useNav();
    const {isAuthenticated} = useAuth();
    const {active, account} = useWeb3React();

    useEffect(() => {
        if (!isAuthenticated || !profileService) return;
        profileService.send({
            type: 'PROFILE_FETCH_INITIATED',
        });
    }, [isAuthenticated, profileService]);


    const onBuyNowClick = () => {
        isAuthenticated ? setIsModalVisible(true) : openNav(true);
    };
    const onCTAClick: MouseEventHandler = (e) => {
        e.preventDefault();
        setSubscribeState(true);
    };

    // OPEN SEA
    return (
        <a href='https://opensea.io/collection/generations-annalucia-geesbend' target='_blank' rel='noreferrer'>
            <button
                className={cn('shadow-button h5-desktop h5-semi-mobile', styles.button, {_visible: isVisible})}>
                BUY ON OPENSEA
            </button>
        </a>
    );

    return (
        <button
            onClick={onCTAClick}
            className={cn('shadow-button h5-desktop h5-semi-mobile', styles.button, {_visible: isVisible})}>
            BUY A SET
        </button>
    );

    if (status === ContractStatusEnum.notStarted && active) return null;


    /*
     <button
          disabled
          className={cn('shadow-button h5-desktop h5-semi-mobile', styles.button, { _visible: isVisible })}>
          Sale coming soon
        </button>
     */


    if (isComingSoon) {
        return (
            <button
                disabled
                className={cn('shadow-button h5-desktop h5-semi-mobile', styles.button, {_visible: isVisible})}>
                Sale coming soon
            </button>
        );
    }

    if (soldOut) {
        return (
            <button
                disabled
                className={cn('shadow-button h5-desktop h5-semi-mobile', styles.button, {_visible: isVisible})}>
                Sold out
            </button>
        );
    }
    /*
        <button
          className={cn('shadow-button h5-desktop h5-semi-mobile', styles.button, { _visible: isVisible })}
          onClick={onBuyNowClick}>
          Buy Now
        </button>
     */
    return (
        <>
            <GenerationsClaimsModal isOpen={isModalVisible} onRequestClose={() => setIsModalVisible(false)}/>
        </>
    );
};

export const GenerationsFixedBuyNowButton: FC<{}> = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const startShowingContainer = document.getElementsByClassName(
            GENERATIONS_BUY_START_POSITION_CLASS,
        )?.[0] as HTMLElement;

        if (!startShowingContainer) return;

        const onScroll = () => {
            const currentScrollPosition = document.documentElement.scrollTop || document.body.scrollTop;
            const viewportHeight = window.innerHeight;
            const {top, height: containerHeight} = startShowingContainer.getBoundingClientRect();
            const containerTopPosition = window.pageYOffset + top;
            const startShowingPosition = containerHeight + containerTopPosition;

            if (currentScrollPosition + viewportHeight > startShowingPosition && !isVisible) {
                setIsVisible(true);
            }
            if (currentScrollPosition + viewportHeight < startShowingPosition && isVisible) {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', onScroll);

        return () => {
            window.removeEventListener('scroll', onScroll);
        };
    }, [isVisible]);

    if (IS_SHOW_GET_EARLY_ACCESS) return <GetEarlyAccess isVisible={isVisible}/>;

    return <BuyNow isVisible={isVisible}/>;
};
