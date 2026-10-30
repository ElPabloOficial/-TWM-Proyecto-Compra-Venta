using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class servicio
{
    public int id { get; set; }

    public string nombre { get; set; } = null!;

    public bool restriccionedad { get; set; }

    public TimeOnly duracion { get; set; }

    public string? caracteristicas { get; set; }

    public int? id_oferta { get; set; }

    public DateOnly? fechainicio { get; set; }

    public DateOnly? fechafin { get; set; }

    public string? imagen { get; set; }

    public virtual ICollection<crear2> crear2s { get; set; } = new List<crear2>();

    public virtual ICollection<crear4> crear4s { get; set; } = new List<crear4>();

    public virtual ICollection<escribir2> escribir2s { get; set; } = new List<escribir2>();

    public virtual ICollection<generar4> generar4s { get; set; } = new List<generar4>();

    public virtual ICollection<hacer2> hacer2s { get; set; } = new List<hacer2>();

    public virtual ofertum? id_ofertaNavigation { get; set; }

    public virtual ICollection<ofrecer2> ofrecer2s { get; set; } = new List<ofrecer2>();

    public virtual ICollection<solicitar2> solicitar2s { get; set; } = new List<solicitar2>();

    public virtual ICollection<valorar> valorars { get; set; } = new List<valorar>();

    public virtual ICollection<categorium> id_categoria { get; set; } = new List<categorium>();
}
