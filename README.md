```bash
$ docker build -t tabata-app .
$ docker run -p 5000:4567 tabata-app
```

or combined

```bash
$ docker build -t tabata-app . && docker run -p 5000:4567 tabata-app
```
and visit [localhost:5000](http://localhost:5000)
