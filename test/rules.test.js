const sinon = require('sinon');
const RuleSet = require('../api/rules.js');

describe('Apply empty rules', () => {
  it('should return a the same request unchanged', () => {
    var fixture = {"Records":[{"cf":{"request":{"headers":{"host":[{"key":"Host","value":"foo.bar.baz"}]},"method":"GET","uri":"/redirecT/3243"}}}]};
    var stub = sinon.stub(RuleSet.prototype,'getRawRules').returns([]);
    var rs = new RuleSet();
    rs.loadRules().then(() => {
      var res = rs.applyRules(fixture).res;
      sinon.assert.match(stub.callCount,1);
      sinon.assert.match(res,fixture.Records[0].cf.request);
      stub.restore();       
    });
  });
});

describe('Apply non-matching rule', () => {
    it('should return a the same request unchanged', () => {
      var fixture = {"Records":[{"cf":{"request":{"headers":{"host":[{"key":"Host","value":"foo.bar.baz"}]},"method":"GET","uri":"/redirecT/3243"}}}]};
      var stub = sinon.stub(RuleSet.prototype,'getRawRules').returns(['^/test/\\d*$ /index2.html [L]']);
      var rs = new RuleSet();
      rs.loadRules().then(() => {
        var res = rs.applyRules(fixture).res;
        sinon.assert.match(stub.callCount,1);
        sinon.assert.match(res,fixture.Records[0].cf.request);
        stub.restore();     
      });
    });
  });
    
  describe('Apply non-matching rule with a host match', () => {
    it('should return a the same request unchanged', () => {
      var fixture = {"Records":[{"cf":{"request":{"headers":{"host":[{"key":"Host","value":"foo.bar.baz"}]},"method":"GET","uri":"/redirecT/3243"}}}]};
      var stub = sinon.stub(RuleSet.prototype,'getRawRules').returns(['^/test/\\d*$ /index2.html [H=foo\.bar.*]']);
      var rs = new RuleSet();
      rs.loadRules().then(() => {
        var res = rs.applyRules(fixture).res;
        sinon.assert.match(stub.callCount,1);
        sinon.assert.match(res,fixture.Records[0].cf.request);
        stub.restore();     
      });
    });
  });  

  describe('Apply matching rewrite rule with a host match', () => {
    it('should return a the an object with the new URI', () => {
      var fixture = {"Records":[{"cf":{"request":{"headers":{"host":[{"key":"Host","value":"foo.bar.baz"}]},"method":"GET","uri":"/redirecT/3243"}}}]};
      var stub = sinon.stub(RuleSet.prototype,'getRawRules').returns(['^/redirecT/\\d*$ /index2.html [H=foo\.bar.*]']);
      var rs = new RuleSet();
      rs.loadRules().then(() => {
        var res = rs.applyRules(fixture).res;
        sinon.assert.match(stub.callCount,1);
        sinon.assert.match(res.uri,'/index2.html');          
        stub.restore();     
      });
    });
  });  

  describe('Apply matching rule with the gone flag', () => {
    it('should return a the an object the gone status', () => {
      var fixture = {"Records":[{"cf":{"request":{"headers":{"host":[{"key":"Host","value":"foo.bar.baz"}]},"method":"GET","uri":"/redirecT/3243"}}}]};
      var stub = sinon.stub(RuleSet.prototype,'getRawRules').returns(['^/redirecT/\\d*$ [G]']);
      var rs = new RuleSet();
      rs.loadRules().then(() => {
        var res = rs.applyRules(fixture).res;
        sinon.assert.match(stub.callCount,1);
        sinon.assert.match(res.status,410);
        sinon.assert.match(res.statusDescription,'Gone'); 
        stub.restore();     
      });
    });
  });  

  describe('Apply matching rule with the forbidden flag', () => {
    it('should return a the an object the forbidden status', () => {
      var fixture = {"Records":[{"cf":{"request":{"headers":{"host":[{"key":"Host","value":"foo.bar.baz"}]},"method":"GET","uri":"/redirecT/3243"}}}]};
      var stub = sinon.stub(RuleSet.prototype,'getRawRules').returns(['^/redirecT/\\d*$ [F]']);
      var rs = new RuleSet();
      rs.loadRules().then(() => {
        var res = rs.applyRules(fixture).res;
        sinon.assert.match(stub.callCount,1);
        sinon.assert.match(res.status,403);
        sinon.assert.match(res.statusDescription,'Forbidden'); 
        stub.restore();     
      });
    });
  });  
  
  describe('Apply multiple matching rules with the forbidden and last flags', () => {
    it('should return a the an object the forbidden status', () => {
      var fixture = {"Records":[{"cf":{"request":{"headers":{"host":[{"key":"Host","value":"foo.bar.baz"}]},"method":"GET","uri":"/redirecT/3243"}}}]};
      var stub = sinon.stub(RuleSet.prototype,'getRawRules').returns(['^/redirecT/\\d*$ [F,L]','^/redirecT/\\d*$ /bar']);
      var rs = new RuleSet();
      rs.loadRules().then(() => {
        var res = rs.applyRules(fixture).res;
        sinon.assert.match(stub.callCount,1);
        sinon.assert.match(res.status,403);
        sinon.assert.match(res.statusDescription,'Forbidden'); 
        stub.restore();     
      });
    });
  }); 

  describe('Apply multiple matching rules without last flag', () => {
    it('should return a the an object the new URI of the last match', () => {
      var fixture = {"Records":[{"cf":{"request":{"headers":{"host":[{"key":"Host","value":"foo.bar.baz"}]},"method":"GET","uri":"/redirecT/3243"}}}]};
      var stub = sinon.stub(RuleSet.prototype,'getRawRules').returns(['^/redirecT/\\d*$ /baz','^/redirecT/\\d*$ /bar']);
      var rs = new RuleSet();
      rs.loadRules().then(() => {
        var res = rs.applyRules(fixture).res;
        sinon.assert.match(stub.callCount,1);
        sinon.assert.match(res.uri,'/bar');
        stub.restore();     
      });
    });
  }); 

  describe('Test no-case match', () => {
    it('should return a the an object the new URI of the first rule', () => {
      var fixture = {"Records":[{"cf":{"request":{"headers":{"host":[{"key":"Host","value":"foo.bar.baz"}]},"method":"GET","uri":"/redirecT/3243"}}}]};
      var stub = sinon.stub(RuleSet.prototype,'getRawRules').returns(['^/redirect/\\d*$ /baz [NC]','^/redirect/\\d*$ /bar']);
      var rs = new RuleSet();
      rs.loadRules().then(() => {
        var res = rs.applyRules(fixture).res;
        sinon.assert.match(stub.callCount,1);
        sinon.assert.match(res.uri,'/baz');
        stub.restore();     
      });
    });
  }); 

  describe('Test redirect rule', () => {
    it('should return a the an object the new URI of the first rule', () => {
      var fixture = {"Records":[{"cf":{"request":{"headers":{"host":[{"key":"Host","value":"foo.bar.baz"}]},"method":"GET","uri":"/redirecT/3243"}}}]};
      var stub = sinon.stub(RuleSet.prototype,'getRawRules').returns(['^/redirect/\\d*$ https://example.org [R,NC]','^/redirect/\\d*$ /bar']);
      var rs = new RuleSet();
      rs.loadRules().then(() => {
        var res = rs.applyRules(fixture).res;
        sinon.assert.match(stub.callCount,1);
        sinon.assert.match(res.status,301);
        sinon.assert.match(res.statusDescription,'Found');
        sinon.assert.match(res.headers.location[0].value,'https://example.org'); 
        stub.restore();     
      });
    });
  }); 

  describe('Test redirect rule variable interpolation', () => {
    it('should return a the an object the new URI of the first rule with the match', () => {
      var fixture = {"Records":[{"cf":{"request":{"headers":{"host":[{"key":"Host","value":"foo.bar.baz"}]},"method":"GET","uri":"/redirecT/3243"}}}]};
      var stub = sinon.stub(RuleSet.prototype,'getRawRules').returns(['^/redirect/(\\d*)$ https://example.org?$1 [R,NC]','^/redirect/\\d*$ /bar']);
      var rs = new RuleSet();
      rs.loadRules().then(() => {
        var res = rs.applyRules(fixture).res;
        sinon.assert.match(stub.callCount,1);
        sinon.assert.match(res.status,301);
        sinon.assert.match(res.statusDescription,'Found');
        sinon.assert.match(res.headers.location[0].value,'https://example.org?324'); 
        stub.restore();     
      });
    });
  }); 

  describe('Test rewrite match with interpolation', () => {
    it('should return a the an object the new URI of the first rule with the match', () => {
      var fixture = {"Records":[{"cf":{"request":{"headers":{"host":[{"key":"Host","value":"foo.bar.baz"}]},"method":"GET","uri":"/redirecT/3243"}}}]};
      var stub = sinon.stub(RuleSet.prototype,'getRawRules').returns(['^/redirect/(\\d*)$ /baz?$1 [NC]','^/redirect/\\d*$ /bar']);
      var rs = new RuleSet();
      rs.loadRules().then(() => {
        var res = rs.applyRules(fixture).res;
        sinon.assert.match(stub.callCount,1);
        sinon.assert.match(res.uri,'/baz?3243');
        stub.restore();     
      });
    });
  }); 
