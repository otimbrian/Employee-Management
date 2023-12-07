import testing from '../utils/for_testing'

test('reverse of a', () => {
    const result = testing.reverse('a')

    expect(result).toBe('a')
})

test('reverse of react', () => {
    const result = testing.reverse('react')

    expect(result).toBe('tcaer')
})

test('reverse of releveler', () => {
    const result = testing.reverse('releveler')

    expect(result).toBe('releveler')
})