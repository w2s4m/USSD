const CACHE_NAME =
"ussd-pay-v2.1";

const FILES = [

"./",
"./index.html",
"./settings.html",
"./offline.html",

"./style.css",
"./script.js",

"./manifest.json",

"./icons/logo.png",

"./icons/icon-192.png",
"./icons/icon-512.png",
"./icons/maskable-512.png"

];

self.addEventListener(

"install",

event=>{

    event.waitUntil(

        caches.open(
            CACHE_NAME
        )

        .then(cache=>{

            return cache.addAll(
                FILES
            );

        })

    );

    self.skipWaiting();

}

);

self.addEventListener(

"activate",

event=>{

    event.waitUntil(

        caches.keys()

        .then(keys=>{

            return Promise.all(

                keys.map(key=>{

                    if(
                        key !==
                        CACHE_NAME
                    ){

                        return caches.delete(
                            key
                        );

                    }

                })

            );

        })

    );

    self.clients.claim();

}

);

self.addEventListener(

"fetch",

event=>{

    event.respondWith(

        caches.match(
            event.request
        )

        .then(response=>{

            return (

                response ||

                fetch(
                    event.request
                )

                .catch(()=>{

                    return caches.match(
                        "./offline.html"
                    );

                })

            );

        })

    );

}

);