using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace Race_Track.Models
{
    public class Vehiculo
    {
        public int VehiculoId { get; set; }

        [Display(Name = "Nombre Propietario")]
        public string? VehiculoNombre {get; set;}
        
        [Display(Name = "Apellido Propietario")]
        public string? VehiculoApellido {get; set;}

        [Display(Name = "Tipo de vehiculo")]
        public string? VehiculoTipo {get; set;}

        [Display(Name = "Matricula")]
        public string? VehiculoMatricula {get; set;}

        [Display(Name = "Modelo")]
        public DateTime VehiculoFabricacion {get;set;}  
        // public int AeronaveCosto {get; set;}

        public ICollection<Piloto> PilotoList { get; set; } = new List<Piloto>();      
    }
}