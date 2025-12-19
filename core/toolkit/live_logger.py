from elasticsearch import Elasticsearch


es = Elasticsearch("https://elasticsearch:9200",
                    basic_auth=("elastic", "Gan5Q2++ncK-6FCTRjsx"),
                    ca_certs="./docker/certs/elastic-stack-ca.crt",
                    headers={"Accept": "application/vnd.elasticsearch+json; compatible-with=8"}
                   )

health = es.cluster.health()


# Search logs
resp = es.search(index="filebeat-*", query={"match_all": {}}, size=5)
print(resp["hits"]["hits"])

