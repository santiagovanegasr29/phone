import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchs'
})
export class SearchsPipe implements PipeTransform {

  transform(items: Array<any>, search: string = null): Array<any> {

    // si no estan mandando nada a buscar entonces devolvemos el mismo valor ingresado
    if(search == null){
        return items;
    }

    // filtramos para devolver
    return items.filter(item => {
        return this.filter(search, item);
    });

}

//Permite buscar de manera recursiva
private filter(search: string, item): boolean {

    // validamos si lo que se esta trabajando es un arreglo de objetos primitivos
    if (this.isPrimitive(item)) {
        return new RegExp(search, 'gi').test(item);
    }

    // obtenemos las llaves de cada item
    const itemsKeys = Object.keys(item);

    // iteramos las llaves
    for(let keyName of itemsKeys) {

        // si el valor de la propiedad es primitivo
        if (this.isPrimitive(item[keyName])) {
            // verificamos si tienen alli lo que estamos buscando
            if(new RegExp(search, 'gi').test(item[keyName])){
                return true;
            }
        }else{
            // como no es primitivo, entonces ejecutamos otra busqueda internamente alli
            return this.filter(search, item[keyName]);
        }
    }

    return false;
}


// Permite verificar si una variable es primitiva
private isPrimitive(customVar) {
    return (customVar !== Object(customVar));
};

}
