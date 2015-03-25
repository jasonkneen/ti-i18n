var fn = function() {},
	obj = {
		fn: fn
	};

obj.titleid = 'aa';
obj.textid = 'ab';
obj.messageid = 'ac';
obj.titlepromptid = 'ad';
obj.subtitleid = 'ae';
obj.hinttextid = 'af';
obj.promptid = 'ag';

obj.titleid = {};
obj.titleid = obj;
obj.titleid = fn();

obj.prop = L('ba');
obj.prop = L('bb', 'bbh');
obj.prop = Ti.Locale.getString('bc');
obj.prop = Ti.Locale.getString('bd', 'bdh');
obj.prop = Titanium.Locale.getString('be');
obj.prop = Titanium.Locale.getString('bf', 'bfh');

obj.prop = L({}, obj);
obj.prop = Ti.Locale.getString(fn(), {});
obj.prop = Titanium.Locale.getString(obj, fn());

obj.fn({
	titleid: 'ca',
	textid: 'cb',
	messageid: 'cc',
	titlepromptid: 'cd',
	subtitleid: 'ce',
	hinttextid: 'cf',
	promptid: 'cg',

	titleid: {},
	titleid: obj,
	titleid: fn(),

	prop: L('da', 'dah'),
	prop: Ti.Locale.getString('db', 'dbh'),
	prop: Titanium.Locale.getString('dc', 'dch'),

	prop: L({}, obj),
	prop: Ti.Locale.getString(fn(), {}),
	prop: Titanium.Locale.getString(obj, fn())
});

obj.setTitleid('ea');
obj.setTextid('eb');
obj.setMessageid('ec');
obj.setTitlepromptid('ed');
obj.setSubtitleid('ee');
obj.setHinttextid('ef');
obj.setPromptid('eg');

obj.setTitleid({});
obj.setTitleid(obj);
obj.setTitleid(fn());

obj.issue14 = L('issue\n14');