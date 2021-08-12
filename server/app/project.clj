(defproject icebreaker "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :dependencies [[org.clojure/clojure "1.10.0"]
                 [compojure "1.6.1"]
                 [hiccup "1.0.5"]
                 [ring-server "0.5.0"]
                 [http-kit "2.5.3"]
                 [org.clojure/data.json "0.2.6"]
                 [javax.xml.bind/jaxb-api "2.4.0-b180830.0359"] ;;https://www.deps.co/blog/how-to-upgrade-clojure-projects-to-use-java-11/
                 ]
  ;; :plugins [[lein-ring "0.12.5"]]
  ;; :ring {:handler icebreaker.handler/app
  ;;        :init icebreaker.handler/init
  ;;        :destroy icebreaker.handler/destroy}
  :main ^:skip-aot icebreaker.handler
  :profiles
  {:uberjar {:aot :all
             :uberjar-name "icebreaker.jar"}
   :production
   {:ring
    {:open-browser? false, :stacktraces? false, :auto-reload? false}}
   :dev
   {:dependencies [[ring/ring-mock "0.4.0"]
                   [ring/ring-devel "1.7.1"]
                   [binaryage/devtools "1.0.0"]]}
   })
