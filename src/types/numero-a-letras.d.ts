declare module "numero-a-letras" {
  interface Options {
    plural?: string;
    singular?: string;
    centPlural?: string;
    centSingular?: string;
  }

  function numeroALetras(valor: number, opciones?: Options): string;

  export default numeroALetras;
}
