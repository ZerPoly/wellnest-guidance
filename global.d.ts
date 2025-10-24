// global.d.ts

// This declaration tells TypeScript to accept imports of any file ending in .css
// and treats the module as a generic type, suppressing the error.
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// If you also use other CSS-like files, include them here for safety:
// declare module '*.scss'; 
// declare module '*.less';