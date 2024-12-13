import { 
    useState 
  } from 'react';

export default function useTest(){
    const [value, setValue] = useState<boolean>(false);
    const test = true;
    
    const toggle = () => {
        setValue((prevValue) => !prevValue);
    };
    
    return [value, toggle];
}