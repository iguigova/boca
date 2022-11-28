(ns icebreaker.routes.websockets
  (:require [compojure.core :refer [defroutes GET]]
            [org.httpkit.server :as srvr] ;; :refer [send! with-channel on-close on-receive]]
            ))

(defonce channels (atom {}))

(defn connect! [pathname channel]
  (println "channel open: " channel " at " pathname)
  (if (contains? @channels pathname)
    (swap! channels update pathname conj channel)
    (swap! channels assoc pathname #{channel})))

(defn disconnect! [pathname channel status]
  (println "channel closed:" status " at " pathname)
  (swap! channels #(remove #{channel} (pathname %)))) ;; swap! channels disj channel

(defn notify-clients [pathname msg]
  (doseq [channel (pathname @channels)]
    (srvr/send! channel msg)))

(defn ws-handler [request]
  (srvr/with-channel request channel
    (let [pathname (keyword (:pathname (:params request)))]
         (connect! pathname channel)
         (srvr/on-close channel (partial disconnect! pathname channel))
         (srvr/on-receive channel #(notify-clients pathname %)))))

(defroutes websocket-routes
  (GET "/ws" request (ws-handler request)))
