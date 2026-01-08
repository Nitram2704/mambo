import { a11y } from '../accessibility';

describe('accessibility utils', () => {
    describe('button', () => {
        it('should return correct accessibility props for a button', () => {
            const props = a11y.button('Click me', 'Submits the form');
            expect(props).toEqual({
                accessible: true,
                accessibilityRole: 'button',
                accessibilityLabel: 'Click me',
                accessibilityHint: 'Submits the form',
                accessibilityState: undefined,
            });
        });

        it('should include accessibilityState if provided', () => {
            const state = { disabled: true };
            const props = a11y.button('Click me', undefined, state);
            expect(props.accessibilityState).toEqual(state);
        });
    });

    describe('header', () => {
        it('should return correct accessibility props for a header', () => {
            const props = a11y.header('Title');
            expect(props).toEqual({
                accessible: true,
                accessibilityRole: 'header',
                accessibilityLabel: 'Title',
                accessibilityLevel: 1,
            });
        });

        it('should allow custom heading level', () => {
            const props = a11y.header('Subtitle', 2);
            expect(props.accessibilityLevel).toBe(2);
        });
    });

    describe('image', () => {
        it('should return correct accessibility props for an image', () => {
            const props = a11y.image('A beautiful landscape');
            expect(props).toEqual({
                accessible: true,
                accessibilityRole: 'image',
                accessibilityLabel: 'A beautiful landscape',
            });
        });
    });

    describe('input', () => {
        it('should return correct accessibility props for an input', () => {
            const props = a11y.input('Username', 'Enter your username');
            expect(props).toEqual({
                accessible: true,
                accessibilityRole: 'text',
                accessibilityLabel: 'Username',
                accessibilityHint: 'Enter your username',
                accessibilityValue: undefined,
            });
        });

        it('should include value if provided', () => {
            const props = a11y.input('Username', undefined, 'JohnDoe');
            expect(props.accessibilityValue).toEqual({ text: 'JohnDoe' });
        });
    });

    describe('decorative', () => {
        it('should return props to hide element from accessibility services', () => {
            const props = a11y.decorative();
            expect(props).toEqual({
                accessible: false,
                accessibilityElementsHidden: true,
                importantForAccessibility: 'no-hide-descendants',
            });
        });
    });

    describe('switch', () => {
        it('should return correct props for a switch', () => {
            const props = a11y.switch('Notifications', true);
            expect(props).toEqual({
                accessible: true,
                accessibilityRole: 'switch',
                accessibilityLabel: 'Notifications',
                accessibilityState: { checked: true },
            });
        });

        it('should reflect off state', () => {
            const props = a11y.switch('Notifications', false);
            expect(props.accessibilityState).toEqual({ checked: false });
        });
    });

    describe('adjustable', () => {
        it('should return correct props for an adjustable element', () => {
            const props = a11y.adjustable('Volume', 50, 0, 100);
            expect(props).toEqual({
                accessible: true,
                accessibilityRole: 'adjustable',
                accessibilityLabel: 'Volume',
                accessibilityValue: {
                    min: 0,
                    max: 100,
                    now: 50,
                },
            });
        });
    });
});
