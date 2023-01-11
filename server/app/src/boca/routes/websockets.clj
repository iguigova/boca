(ns boca.routes.websockets
  (:require [compojure.core :refer [defroutes GET]]
            [org.httpkit.server :as srvr] ;; :refer [send! with-channel on-close on-receive]]
            [boca.environment :as environment]))

(def E (environment/context))

(defonce channels (atom {}))
(defonce messages (atom {}))

(defn store! [store pathname obj fn]
  (if (contains? @store pathname)
    (swap! store update pathname conj obj)
    (swap! store assoc pathname (fn obj)))
  (if (<= (:capacity E) (count (pathname @store)))
    (do (println "dropping oldest message in " pathname)
        (swap! store update-in [pathname] #(drop-last %)))))

(defn record! [pathname msg]
  (store! messages pathname msg list))

(defn sync-messages [pathname channel]
  (doseq [msg (reverse (pathname @messages))]
    (srvr/send! channel msg)))

(defn connect! [pathname channel]
  (println "channel open: " channel " at " pathname)
  (store! channels pathname channel #(set (list %)))
  (sync-messages pathname channel))

(defn disconnect! [pathname channel status]
  (println "channel closed:" status " at " pathname)
  (swap! channels update-in [pathname] #(remove #{channel} %))) ;; swap! channels disj channel

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
