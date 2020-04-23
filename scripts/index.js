"use strict";

var LoremIpsumGeneratorModule = (function(doc) {
		var formElem, formChildren, paragraph, sentence, output;
		var init = function(config) {
			_addEventListeners(config);
		}
		var _textUtils = {
			capitalize: function(value) {
				return value.charAt(0).toUpperCase() + value.substring(1, value.length - 1);
			},
			nl2br: function(value) {
				return value.replace(/(?:\r\n|\r|\n)/g, '<br>');
			},
			br2nl: function(value) {
				return value.replace(/(\<(br)(\/)?\>)/g, '\n');
			},
			copyToClipboard: function(str) {
				var el = doc.createElement('textarea');
				el.value = str;
				el.setAttribute('readonly', '');
				el.style.position = 'absolute';
				el.style.left = '-9999px';
				doc.body.appendChild(el);
				el.select();
				if (doc.execCommand('copy')) {
					doc.body.removeChild(el);
					return true;
				}
				return null;
			}
		}
		var _generator = {
			wordsCount: {max: 15, min: 5},
			WORDS: ["ad", "adipisicing", "aliqua", "aliquip", "amet", "anim", "aute", "cillum", "commodo", "consectetur", "consequat", "culpa", "cupidatat", "deserunt", "do", "dolor", "dolore", "duis", "ea", "eiusmod", "elit", "enim", "esse", "est", "et", "eu", "ex", "excepteur", "exercitation", "fugiat", "id", "in", "incididunt", "ipsum", "irure", "labore", "laboris", "laborum", "Lorem", "magna", "minim", "mollit", "nisi", "non", "nostrud", "nulla", "occaecat", "officia", "pariatur", "proident", "qui", "quis", "reprehenderit", "sint", "sit", "sunt", "tempor", "ullamco", "ut", "velit", "veniam", "voluptate"],
			paragraphs: function(value) {
				var output = [];
				for (var i = 0; i < value; i++) {
					var nSentences = Math.round(Math.random() * (this.wordsCount.max - this.wordsCount.min) + this.wordsCount.min);
					output.push(this.sentences(nSentences));
				}
				return output.join('\n\n');
			},
			sentences: function(value) {
				var nWords = Math.round(Math.random() * (this.wordsCount.max - this.wordsCount.min) + this.wordsCount.min);
				var output = [];
				for(var i = 0; i < value; i++) {
					var tmpOutput = [];
					for(var j = 0; j < nWords; j++) {
						var w = this.WORDS[Math.floor(Math.random() * this.WORDS.length)];
						tmpOutput.push(0 === j ? _textUtils.capitalize(w) : w);
					}
					output.push(tmpOutput.join(' ') + '.');
				}
				return output.join(' ');
			}
		}

		var _addEventListeners = function(config) {
			formElem = doc.forms[config.form];
			output = doc.querySelector(config.output);
			if (formElem) {
				formChildren = formElem.elements;
				paragraph = formChildren[config.paragraphInput];
				sentence = formChildren[config.sentenceInput];
				paragraph.addEventListener('focus', function() {
					sentence.value = null;
				}, false);
				sentence.addEventListener('focus', function() {
					paragraph.value = null;
				}, false);
				formElem.addEventListener('submit', function(e) {
					e.preventDefault();
					var result = {
						paragraphCount: 0,
						wordCount: 0,
						output: null
					};
					if (!isNaN(+paragraph.value) && paragraph.value) {
						result.output = _generator.paragraphs(paragraph.value);
					}
					if (!isNaN(+sentence.value) && sentence.value) {
						result.output = _generator.sentences(sentence.value);
					}
					if (output && result.output) {
						output.innerHTML = _textUtils.nl2br(result.output);
					}
				}, false)
				var copyButton = doc.querySelector(config.copyButton);
				if(copyButton && output) {
					copyButton.addEventListener('click', function() {
						var initialButtonContent = copyButton.innerHTML;
						if(_textUtils.copyToClipboard(_textUtils.br2nl(output.innerHTML))) {
							copyButton.innerHTML = 'copied!';
							setTimeout(function() {
								copyButton.innerHTML = initialButtonContent;
							}, 3500);
						}
					})

				}
			}
		}

	return {
		init: init
	}
})(window.document).init({
	form: 'lorem_ipsum_form',
	paragraphInput: 'paragraph',
	sentenceInput: 'sentence',
	output: '#output',
	copyButton: '#copy'
});
