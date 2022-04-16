const People = artifacts.require("People");
const truffleAssert = require("truffle-assertions");

contract ("People", async function(accounts) {

    let instance;

    before(async function() {
        instance = await People.deployed()
    });

    it("shouldn't create a persn with age over 150 years", async function(){
        await truffleAssert.fails(instance.createPerson("Bob", 200, 190, {value: web3.utils.toWei("1", "ether")}), truffleAssert.ErrorType.REVERT);
    });
    it("shouldn't create a person without payment", async function() {
        await truffleAssert.fails(instance.createPerson("Bob", 50, 190, {value: 1000}), truffleAssert.ErrorType.REVERT);
    });
    it("should set senior status correctly", async function() {
        await instance.createPerson("Bob", 65, 190, {value: web3.utils.toWei("1", "ether")});
        let result = await instance.getPerson();
        assert(result.senior === true, "Senior level not set");
    });
    it("shouldn't be possible to delete a different account's person", async function(){
        await instance.createPerson("Bob", 50, 180, {value:web3.utils.toWei("1", "ether"), from: accounts[0]});
        await truffleAssert.fails(instance.deletePerson(accounts[0], {from: accounts[3]}), truffleAssert.ErrorType.REVERT);
    });
    it("should increase the balance when a person is created", async function(){
        let Balance = await web3.eth.getBalance(People.address);
        await instance.createPerson("Bob", 50, 180, {value:web3.utils.toWei("1", "ether"), from: accounts[0]});
        let newBalance = await web3.eth.getBalance(People.address);
        assert (newBalance == parseInt(Balance) + parseInt(web3.utils.toWei("1", "ether")), "Funds were not transferred correctly");
    });
    it("should have a contract balance that is the same as the local variable balance", async function(){
        let Balance = await instance.balance();
        let contractBalance = await web3.eth.getBalance(People.address);
        assert (Balance == contractBalance, "balances do not match up");
    });
    it("should not allow a non-owner to withdraw funds", async function(){
        await truffleAssert.fails(instance.withdrawAll({from: accounts[3]}), truffleAssert.ErrorType.REVERT);
    });
    it("should allow owner to withdraw funds", async function(){
        await truffleAssert.passes(instance.withdrawAll({from: accounts[0]}));
    })

})