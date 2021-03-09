
declare let Dexie;


var db = new Dexie("contact");
db.version(1).stores({
  contacts: "name,numberPhone"
});


export class ContactService extends Dexie {
    constructor() {
      super('Ng2DexieSample');
      this.version(1).stores({
        todos: '++id',
      });
    }
  }
