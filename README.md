## fh-mbaas-middleware - FeedHenry MBaaS Middleware config
 
* Create a module that can be used by both fh-mbaas and the new fh-mbaas-service (for openshift)

### Testing

* Execute 'grunt fh:test' for testing. Some tests for fh-mbaas have been carried over to this package (library access)
* Before running the grunt fh:test (fh:test will execute unit,accept and integrate) command, make sure you have a local instance (port 27017) of mongdb running.

Open a mongo shell and execute the following
```bash
use admin
db.addUser('admin','admin'); # for version 2.4.6
db.createUser({ user: "admin",pwd: "admin",roles: [ { role: "clusterAdmin", db: "admin" }, { role: "readWriteAnyDatabase", db: "admin" },"readWrite"] }, { w: "majority" , wtimeout: 25000 }); # for versions 2.6.4 or greater
exit
```
### License

fh-mbaas-middleware is licensed under the [Apache License, Version 2.0](http://www.apache.org/licenses/).
