(ns icebreaker.routes.websockets
  (:require [compojure.core :refer [defroutes GET]]
            [org.httpkit.server :as srvr] ;; :refer [send! with-channel on-close on-receive]]
            ))

(defonce channels (atom #{}))

(defn connect! [channel]
  (println "channel open:" channel)
  (swap! channels conj channel))

(defn disconnect! [channel status]
  (println "channel closed:" status)
  (swap! channels #(remove #{channel} %))) ;; swap! channels disj channel

(defn notify-clients [msg]
  (doseq [channel @channels]
    (srvr/send! channel msg)))

(defn ws-handler [request]
  (srvr/with-channel request channel
    (connect! channel)
    (srvr/on-close channel (partial disconnect! channel))
    (srvr/on-receive channel #(notify-clients %))))

(defroutes websocket-routes
  (GET "/ws" request (ws-handler request)))
