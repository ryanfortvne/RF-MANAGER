import { useState, useEffect } from 'react'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(initialValue)

  // Load from localStorage when component mounts
  useEffect(() => {
    try {
      const item = localStorage.getItem(key)
      if (item) {
        setValue(JSON.parse(item))
      }
    } catch (error) {
      console.log('LocalStorage load failed')
    }
  }, [key])

  // Save to localStorage when value changes
  const setStoredValue = (newValue) => {
    try {
      setValue(newValue)
      localStorage.setItem(key, JSON.stringify(newValue))
    } catch (error) {
      console.log('LocalStorage save failed')
    }
  }

  return [value, setStoredValue]
}
