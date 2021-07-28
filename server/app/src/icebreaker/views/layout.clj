(ns icebreaker.views.layout
  (:require [hiccup.page :refer [html5 include-css]]))

(defn common [& body]
  (html5
    [:head
     [:title "Welcome to icebreaker"]
     (include-css "/css/screen.css")]
    [:body body]))

(defn boca []
  (html5
   [:head
    [:title "Boca"]
    [:meta {:name "viewport" :content "width=device-width, initial-scale=1"}]
    (include-css "/css/boca.css")]
   [:body
    [:div#root]
    [:script {:type "text/javascript" :src "https://unpkg.com/react/umd/react.production.min.js"}]
    [:script {:type "text/javascript" :src "https://unpkg.com/react-dom/umd/react-dom.production.min.js"}]
    [:script {:type "text/javascript" :src "https://unpkg.com/dompurify/dist/purify.min.js"}]

    [:script {:type "module" :src "/dist/boca.js"}]])
  )
