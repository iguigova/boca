(ns icebreaker.routes.json
  (:require [compojure.core :refer [defroutes GET]]
            [clojure.data.json :as json]))

(def json-collection (atom []))

(defn addjson [json]
  (swap! json-collection conj json))

(addjson {:name "jsontest"})

(defn json-handler []
  {:status 200
   :headers {"Content-Type" "text/json"}
   :body (str (json/write-str @json-collection))})

(defroutes json-routes
  (GET "/*" [] (json-handler))
  )
