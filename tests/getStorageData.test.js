

import { beforeEach, describe, expect } from "vitest";
import { getStorageData } from "../utils";

const storage = {
    date: new Date(Date.now()),
      name: "new-entry",
      WPM: 30,
      accuracy: 99,
      correctChars: 100,
      incorrectChars: 1,
}
describe('getStorageData', () => {
    beforeEach(() => {
        window.localStorage.clear();
    })
    it('should return empty array when storage is empty', () => { 
        
        expect(getStorageData()).toEqual([])
    })
  it('should return parsed records when storage has valid data', () => { 

    localStorage.setItem("history", JSON.stringify([storage]));
    expect(getStorageData()).toEqual([expect.objectContaining({
        name: "new-entry",
      WPM: 30,
      accuracy: 99,
      correctChars: 100,
      incorrectChars: 1,
    })])
  })
  it('should return empty array when storage contains invalid JSON', () => { 
    localStorage.setItem('history', 'random string');
    expect(getStorageData()).toEqual([])

  })
})