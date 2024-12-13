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