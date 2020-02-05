class Store{
    constructor (clients){
        this.clients = clients;
    }

    add(key, value){
        this.clients = this.clients.insert(key, value);
    }

    remove(key){
        this.clients = this.clients.remove(key);
    }

    get(key){
        return this.clients.get(key);
    }
    
    getAll(){
        return this.clients;
    }

    setClients(clients){
        this.clients = clients;
    }
}

export default Store;