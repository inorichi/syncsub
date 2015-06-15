SyncSub is an attempt to provide an online collaborative platform for subtitles using WebSockets.

It's written in Python, and uses Django as the web framework and Tornado for WebSockets.

At the moment it doesn't has many features (like the great Aegisub), but it can do the job.

You can import a subtitle from Aegisub and save it to your computer at any moment.

SyncSub uses [libjass](https://github.com/Arnavion/libjass) to render subtitles on the video.


# Installation

I recommend using [virtualenvwrapper](https://virtualenvwrapper.readthedocs.org/en/latest/), which makes things easier. The following steps assumes you have it already installed.


First create a virtualenv:

```bash
$ mkvirtualenv syncsub
$ workon syncsub
```

Clone the repository and navigate to the directory:

```bash
$ git clone https://github.com/inorichi/syncsub.git
$ cd syncsub
```

Install the dependencies:

```bash
$ pip install -r requirements.txt
```

Create a database (you can use any database Django supports, refer to the docs if you want to use another one). In this example we use SQLite. You should create a superuser when asked so.

```bash
$ python manage.py makemigrations
$ python manage.py migrate
```

Collect static files:

```bash
$ python manage.py collectstatic
```

Finally, start the server:

```bash
$ python run.py
```
