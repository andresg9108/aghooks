import { useState } from 'react';
export default function useTest() {
    const [value, setValue] = useState(false);
    const test = true;
    const toggle = () => {
        setValue((prevValue) => !prevValue);
    };
    return [value, toggle];
}
//# sourceMappingURL=useTest.js.map