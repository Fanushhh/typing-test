
import transformData from "../utils.ts"


describe('transformData', () => {
    it('should swap each char with a HTML span element with a class of input-char and add the value within', () => {
        const result = transformData('hi')
        expect(result).toBe('<span class=\"input-char\">h</span><span class=\"input-char\">i</span>')
    })
    it('should return an empty string', () => {
        const result = transformData('');
        expect(result).toBe('')
    })
})