import { useState, useEffect } from 'react';
export default function useDimensions() {
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    useEffect(() => {
        function handleResize() {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }
        window.addEventListener('resize', handleResize);
    }, []);
    return {
        width: dimensions.width,
        height: dimensions.height
    };
}
//# sourceMappingURL=useDimensions.js.map