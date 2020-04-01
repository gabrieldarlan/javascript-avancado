class NegociacaoService {
    // 0: requisição ainda não iniciada
    // 1: conexão com o servidor estabelecida
    // 2: requisição recebida
    // 3: processando requisição
    // 4: requisição está concluída e a resposta está pronta

    constructor() {
        this.http = new HttpService();
    }

    obterNegociacoesDaSemana() {

        return new Promise((resolve, reject) => {

            this.http
                .get('negociacoes/semana')
                .then(negociacoes => {
                    resolve(negociacoes.map(objeto => new Negociacao(new Date(objeto.data), objeto.quantidade, objeto.valor)))
                })
                .catch(erro => {
                    console.log(erro);
                    reject('Não foi possível obter as negociações da semana.')
                });
        });
    }

    obterNegociacoesDaSemanaAnterior() {

        return new Promise((resolve, reject) => {

            this.http
                .get('negociacoes/anterior')
                .then(negociacoes => {
                    resolve(negociacoes.map(objeto => new Negociacao(new Date(objeto.data), objeto.quantidade, objeto.valor)))
                })
                .catch(erro => {
                    console.log(erro);
                    reject('Não foi possível obter as negociações da semana anterior.')
                });
        });

    }

    obterNegociacoesDaSemanaRetrasada() {
        return new Promise((resolve, reject) => {

            this.http
                .get('negociacoes/retrasada')
                .then(negociacoes => {
                    resolve(negociacoes.map(objeto => new Negociacao(new Date(objeto.data), objeto.quantidade, objeto.valor)))
                })
                .catch(erro => {
                    console.log(erro);
                    reject('Não foi possível obter as negociações da semana retrasada.')
                });
        });


    }

    obterNegociacoes() {

        return Promise.all([
            this.obterNegociacoesDaSemana(),
            this.obterNegociacoesDaSemanaAnterior(),
            this.obterNegociacoesDaSemanaRetrasada()
        ]).then(periodos => {

            let negociacoes = periodos
                .reduce((dados, periodo) => dados.concat(periodo), [])
                .map(dado => new Negociacao(new Date(dado.data), dado.quantidade, dado.valor));

            return negociacoes;
        }).catch(erro => {
            throw new Error(erro);
        });
    }

    cadastrar(negociacao) {

        return ConnectionFactory
            .getConnection()
            .then(connection => new NegociacaoDao(connection))
            .then(dao => dao.adiciona(negociacao))
            .then(() => 'Negociacao adicionada com sucesso')
            .catch(() => { throw new Error('Não foi possível adicionar a negociação') });
    }

    lista() {

        return ConnectionFactory
            .getConnection()
            .then(connection => new NegociacaoDao(connection))
            .then(dao => dao.listaTodos())
            .catch(erro => {
                console.log(erro);
                throw new Error('Não foi possível obter as negociações');
            });
    }

    apaga() {

        return ConnectionFactory
            .getConnection()
            .then(connection => new NegociacaoDao(connection))
            .then(dao => dao.apagaTodos())
            .then(() => 'Negociações apagadas com sucesso')
            .catch(erro => {
                  console.log(erro);
                  throw new Error('Não foi possível apagar as negociações')
            });
    }

    importa(listaAtual) {

        return this.obterNegociacoes()
            .then(negociacoes =>
                negociacoes.filter(negociacao =>
                    !listaAtual.some(negociacaoExistente =>
                        JSON.stringify(negociacao) == JSON.stringify(negociacaoExistente)))
            )
    }

}