var models = require('../models/models.js'); //coje el modelo estructura de cuestionario

exports.load = function(req, res, next, cuestionarioId) {
		models.Cuestionario.find({
			where: {
				id: Number(cuestionarioId)
			},
			include: [{ model: models.Profesor }]
		}).then(function(cuestionario) {
			if(cuestionario) {
				req.cuestionario = cuestionario;
				next();
			} else { next(new Error('No existe cuestionarioId=' + cuestionarioId))}	
		}
	).catch(function(error){next(error)});
}

//  GET/cuestionarios VISTA DE LISTA CUESTIONARIOS
exports.index = function(req, res) {
	models.Cuestionario.findAll({
			include: [{ model: models.Profesor }]
		}).then(
                function(cuestionarios) {
    res.render('cuestionarios/index.ejs', {cuestionarios: cuestionarios});
});
}

// GET /cuestionarios/:id/edit
exports.edit = function(req, res) {
    var cuestionario = req.cuestionario; //autoload de instancia de cuestionario
    res.render('cuestionarios/edit', {cuestionario: cuestionario});
};

exports.buscarPreguntas = function(req,res) {
    var preguntasCuestionario = req.cuestionario.preguntas.split(",");
    models.Quiz.finAll().then(function(quizes) {
        where: {
            preguntasCuestionario : Array(Number)(preguntasCuestionario);
        }        
    }).then(function(quizes) {
        res.render('cuestionarios/show', {quizes: quizes, preguntasCestionario: preguntasCuestionario, errors: []});
    })
};

exports.update = function(req, res) {
    req.cuestionario.observaciones = req.body.cuestionario.observaciones;
    req.cuestionario.fechaFin = req.body.cuestionario.fechaFin;
    req.cuestionario.preguntas = req.body.cuestionario.preguntas;
    
    req.cuestionario
            .validate()
            .then(
            function(err){
                if(err){
                    res.render('cuestionarios/edit',{cuestionario: req.cuestionario});
                }else{
                    req.cuestionario
                            .save({fields:["observaciones","fechaFin","preguntas"]})
                            .then(function(){res.redirect('/admin/cuestionarios');});
                }
            }
        );
};

//Borrar cuestionarios
exports.destroy = function(req, res){
	req.cuestionario.destroy().then(function(){
        res.redirect('/admin/cuestionarios');
    }).catch(function(error){next(error)});
}
// GET /cuestionarios/new
exports.new = function(req, res) {
	var cuestionario = models.Cuestionario.build( //crea objeto cuestionario
	{creador: "Creador", observaciones: "Observaciones", fechaFin: "Fecha de Finalizacion", preguntas: "Preguntas asociadas"}
	);
    res.render('cuestionarios/new', {cuestionario: cuestionario});
};

exports.show = function(req, res) {
    res.render('cuestionarios/show', {cuestionario: req.cuestionario});
};

// POST /cuestionario/create
exports.create = function(req, res) {
	var cuestionario = models.Cuestionario.build( req.body.cuestionario );
	cuestionario.set('creador',req.session.profesor.id);
	cuestionario.validate()
	.then(
		function(err){
			if(err) {
			res.render('cuestionarios/new', {cuestionario: cuestionario, errors: err.errors});
			} else {
				for(prop in cuestionario.dataValues) {console.log(prop + ' - ' + cuestionario[prop])};
				cuestionario.save({fields: ["fechaFin", "observaciones", "creador", "preguntas"]}).then(function(){
					res.redirect('/admin/cuestionarios');
				})	//Redireccion HTTP (URL relativo) lista de cuestionarios
			}
		}
	);
};
