function formatRut(inRut) {

    let outRut = inRut.replace(/[^0-9kK]/g, '');

    outRut = outRut.slice(0, 9);

    if (outRut.length > 1) {
        const body = outRut.slice(0, -1);
        const dv = outRut.slice(-1);

        let bodyDots = '';
        for (let i = body.length - 1, count = 0; i >= 0; i--) {
            bodyDots = body[i] + bodyDots;
            count++;
            if (count % 3 === 0 && i > 0) {
                bodyDots = '.' + bodyDots;
            }
        }

        outRut = bodyDots + '-' + dv;
    }

    return outRut.toUpperCase();;
}

export default formatRut;
