export default class Vm {
    constructor(size, initialImage) {
        this.cyclesToWait = 0
        this.pc = 0;
        this.sp = 0;

        if (initialImage) {
            const diff = size - initialImage.length
            if (diff > 0) {
                this.memory = this.initialImage.concat(new Array(diff))
            } else {
                this.memory = initialImage
            }
        } else {
            this.memory = new Array(size)
        }
    }
}