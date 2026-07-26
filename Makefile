.PHONY: build images verify serve shots all clean

build:
	node tools/build.js

# --dry-run reports candidates + license verdicts without downloading or writing.
images:
	node tools/fetch-images.js
	node tools/make-images.js

verify:
	node tools/verify.js

serve:
	python3 -m http.server 7800

shots:
	node tools/shots.js

all: build images verify

clean:
	rm -rf .cache
