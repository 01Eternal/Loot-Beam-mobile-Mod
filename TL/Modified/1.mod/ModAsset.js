const Asset = new NativeClass('ReLogic.Content', 'Asset`1')
        
export class ModAsset {
    constructor(type, name, value) {
        this.asset = Asset.makeGeneric(type).new();
        this.asset["void .ctor(string name)"](name);
        this.asset.Value = value;
    }
}