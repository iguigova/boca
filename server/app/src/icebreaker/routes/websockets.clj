(ns icebreaker.routes.websockets
  (:require [compojure.core :refer [defroutes GET]]
            [org.httpkit.server :as srvr] ;; :refer [send! with-channel on-close on-receive]]
            ))

(defonce channels (atom {}))
(defonce messages (atom {}))

(defn connect! [pathname channel]
  (println "channel open: " channel " at " pathname)
  (store! channels pathname channel)
  (sync-messages pathname channel))

(defn disconnect! [pathname channel status]
  (println "channel closed:" status " at " pathname)
  (swap! channels #(remove #{channel} (pathname %)))) ;; swap! channels disj channel

(defn record! [pathname msg]
  (store! messages pathname msg))

(defn store! [store pathname obj]
  (if (contains? @store pathname)
    (swap! store update pathname conj obj)
    (swap! store assoc pathname #{obj}))  )

(defn sync-messages [pathname channel]
  (doseq [msg (pathname @messages)]
    (srvr/send! channel msg)))

(defn notify-channels [pathname msg]
  (record! pathname msg)
  (doseq [channel (pathname @channels)]
    (srvr/send! channel msg)))

(defn ws-handler [request]
  (srvr/with-channel request channel
    (let [pathname (keyword (:pathname (:params request)))]
         (connect! pathname channel)
         (srvr/on-close channel (partial disconnect! pathname channel))
         (srvr/on-receive channel #(notify-channels pathname %)))))

(defroutes websocket-routes
  (GET "/ws" request (ws-handler request)))
