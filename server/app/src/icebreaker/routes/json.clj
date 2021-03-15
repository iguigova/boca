(ns icebreaker.routes.json
  (:require [compojure.core :refer [defroutes GET]]
            [clojure.data.json :as json]))

(def json-collection (atom []))

(defn addjson [json]
  (swap! json-collection conj json))

;(addjson {:name "jsontest"})

(defn json-handler [request]
  (addjson {:uri (:uri request)})
  {:status 200
   :headers {"Content-Type" "text/json"}
   :body (str (json/write-str @json-collection))})

(defn request-example [request]
     {:status  200
      :headers {"Content-Type" "text/html"}
      :body (str "Request Object: " request "\nRequest uri: " (:uri request))})

(defroutes json-routes
  (GET "/request-example" [] request-example)
  (GET "/json/*" [] json-handler)
  )
