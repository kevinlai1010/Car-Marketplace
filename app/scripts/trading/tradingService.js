(function () {
    'use strict';
    var db = new PouchDB('mydb-idb');

    db.info().then(function (info) {
        console.log('Database initialized');
    }).catch(function (err) {
        console.log('Error initializing database');
    });
    angular.module('app')
        .service('tradingService', ['$q', TradingService]);

    /*db.allDocs().then(function (result) {
        // Promise isn't supported by all browsers; you may want to use bluebird
        return Promise.all(result.rows.map(function (row) {
            return db.remove(row.id, row.value.rev);
        }));
    }).then(function () {
        // done!
    }).catch(function (err) {
        // error!
    });*/
    function TradingService($q) {
        return {
            getTradings: getAll,
            getById: getTradingById,
            create: createTrading,
            destroy: deleteTrading,
            update: updateTrading
        };

        function getAll(query) {
            console.log("get all with");
            console.log(query);
            var deferred = $q.defer();
            db.allDocs({include_docs: true, descending: true, attachments: true}, function (err, doc) {
                let k,
                    items = [],
                    row = doc.rows;

                for (k in row) {
                    var item = row[k].doc
                    if(item.type != undefined && item.type != 'autoincrement')
                        items.push({id: item._id, make: item.make, vin: item.vin, seller: item.seller, buyDate: item.buyDate, buyer: item.buyer, remarks: item.remarks, sellDate: item.sellDate});
                }
                deferred.resolve(items);
            });

            return deferred.promise;
        }

        function getTradingById(id) {
            var deferred = $q.defer();
            var query = "SELECT * FROM tradings WHERE trading_id = ?";
            connection.query(query, [id], function (err, rows) {
                if (err) deferred.reject(err);
                deferred.resolve(rows);
            });
            return deferred.promise;
        }

        function nextId() {
            var deferred = $q.defer();

            db.get("autoincrement", {}, function callback(err, result) {
                if (!err) {
                    updateId(result, deferred)
                    return result.value + 1;
                }
                else {
                    insertNewId();
                    deferred.resolve(1);
                }
            });

            return deferred.promise;
        }

        function updateId(object, deferred) {
            object.value += 1;
            db.put(object, function callback(err, result) {
                if (!err) {
                    console.log(result, 'Id Updated success');
                    deferred.resolve(object.value);
                }
                else {
                    console.log('id updated error');
                }
            });
        }

        function insertNewId() {
            var object = {
                type: 'autoincrement',
                _id: 'autoincrement',
                value: 1
            };
            db.put(object, function callback(err, result) {
                if (!err) {
                    console.log(result, 'Inserted success new id');
                }
                else {
                    console.log('id insertion error');
                }
            });
        }

        function createTrading(trading) {
            console.log("Inserting");
            console.log(trading);
            var deferred = $q.defer();
            nextId().then(function (id) {
                console.log(id, "new id retrieved");
                var created = new Date().toISOString().slice(0, 19);
                var object = {
                    type: 'trading',
                    _id: ""+id,
                    make: trading.make,
                    vin: trading.vin,
                    seller: trading.seller,
                    buyDate: trading.buyDate,
                    remarks: trading.remarks
                };
                if (trading.selled == 'oui') {
                    object.buyer = trading.buyer;
                    object.sellDate = trading.sellDate;
                }
                db.put(object, function callback(err, result) {
                    if (!err) {
                        console.log('Inserted success');
                        console.log(result);
                        deferred.resolve(result.insertId);
                    }
                    else {
                        console.log('Insertion error');
                        console.dir(err);
                    }
                });
            });

            return deferred.promise;
        }

        function deleteTrading(id) {
            var deferred = $q.defer();
            var query = "DELETE FROM tradings WHERE trading_id = ?";
            connection.query(query, [id], function (err, res) {
                if (err) deferred.reject(err);
                console.log(res);
                deferred.resolve(res.affectedRows);
            });
            return deferred.promise;
        }

        function updateTrading(trading) {
            var deferred = $q.defer();
            var query = "UPDATE tradings SET name = ? WHERE trading_id = ?";
            connection.query(query, [trading.name, trading.trading_id], function (err, res) {
                if (err) deferred.reject(err);
                deferred.resolve(res);
            });
            return deferred.promise;
        }
    }
})();