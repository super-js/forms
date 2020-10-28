declare module '*.css' {
    const classes: { [key: string]: string };
    export default classes;
}

declare module "*.svg" {
    const content: any;
    export default content;
}

declare module "*.png" {
    const content: any;
    export default content;
}