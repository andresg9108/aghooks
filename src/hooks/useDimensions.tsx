import { 
    useState, 
    useEffect 
} from 'react';

interface dimensionsUseState {
    width: number;
    height: number;
}

export default function useDimensions(){
    const [dimensions, setDimensions] = useState<dimensionsUseState>({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });

            function handleResize() {
                setDimensions({
                    width: window.innerWidth,
                    height: window.innerHeight,
                });
            }
            
            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }
    }, []);

    return {
        width: dimensions.width, 
        height: dimensions.height 
    };
}