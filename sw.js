const CACHE_NAME =
"ussd-pay-v1.2";

const FILES = [

"/USSD/",
"/USSD/index.html",
"/USSD/settings.html",
"/USSD/offline.html",

"/USSD/style.css",
"/USSD/script.js",

"/USSD/manifest.json",

"/USSD/icons/logo.png",

"/USSD/icons/icon-192.png",
"/USSD/icons/icon-512.png",
"/USSD/icons/maskable-512.png"

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