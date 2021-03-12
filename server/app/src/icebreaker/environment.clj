(ns icebreaker.environment
  (:require [icebreaker.util :as u]
            ))

(defn context []
  {:port (u/parse-int (or (System/getenv "PORT") "3000"))
   :production (u/parse-bool (or (System/getenv "PRODUCTION") "false"))})
