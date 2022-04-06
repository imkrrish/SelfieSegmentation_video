import React, { Suspense } from 'react'
import Lottie from 'react-lottie'


const DisplayLottie = ({ animationData }) => {
    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
    };

    return (
        <div>
            <Suspense>
                {/* To override default onClick pause by Lottie */}
                <div onClick={() => null}>
                    <Lottie
                        isClickToPauseDisabled={true}
                        options={defaultOptions}
                    />
                </div>
            </Suspense>
        </div>
    )
}

export default DisplayLottie