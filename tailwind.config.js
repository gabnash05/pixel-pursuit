/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
                fontFamily: {
                    // Here, we map a custom class name to the font name loaded in App.js
                    'josefin-regular': ['JosefinSans-Regular'],
                    'josefin-bold': ['JosefinSans-Bold'],
                    'josefin-italic': ['JosefinSans-Italic'],
                    'josefin-medium': ['JosefinSans-Medium'],
                    'josefin': ['JosefinSans'],
                },
            },
    },
    plugins: [],
}