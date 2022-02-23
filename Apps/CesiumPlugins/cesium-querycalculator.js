function openQC(){
	$('.queryCalculator').toggle();
}

function openQCR(){
	$('.queryCalculatorResult').show();
}

function closeQC(){
	$('.queryCalculatorResult').hide();
	$('#queryCalculator').css('display','none');
}

function closeQCR(){
	$('.queryCalculatorResult').hide();
}

function minimizeQCR(){
	$('#minQCR').hide();
	$('#maxQCR').show();
	$('.queryCalcResultBody').hide();
}

function maximizeQCR(){
	$('#maxQCR').hide();
	$('#minQCR').show();
	$('.queryCalcResultBody').show();
}
